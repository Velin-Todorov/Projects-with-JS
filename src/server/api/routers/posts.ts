import type { User } from "@clerk/nextjs/api";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
	createTRPCRouter,
	publicProcedure,
	privateProcedure
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";


const filterUserForClient = (user: User) => {
	return {
		id: user.id,
		name: user.username,
		profilePic: user.profileImageUrl
	}
}


export const postsRouter = createTRPCRouter({

	getAll: publicProcedure.query(async ({ ctx }) => {

		const posts = await ctx.prisma.post.findMany({
			take: 100,
			orderBy: [{ createdAt: 'desc' }],
		})

		const users = (await clerkClient.users.getUserList({
			userId: posts.map((post) => post.authorId),
			limit: 100,

		})).map(filterUserForClient)

		return posts.map((post) => {
			const author = users.find((user) => user.id === post.authorId);

			if (!author || !author.name) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author for post not found"
				});
			}

			return {
				post,
				author: {
					...author,
					username: author.name,
				}
			};
		})
	}),

	create: privateProcedure.input(
		z.object({
			content: z.string().emoji().min(1).max(280),
		})
	)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.userId;

			const post = await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content
				},
			});

			return post;
		}),

	getSecretMessage: privateProcedure.query(() => {
		return "you can now see this secret message!";
	})
})
	



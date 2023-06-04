import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { SignIn, SignInButton, useUser, SignOutButton } from '@clerk/nextjs'
import { Router } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";


dayjs.extend(relativeTime)


const CreatePostWizard = () => {
	const { user } = useUser();

	if (!user) return null

	return (<div className="flex gap-3 p-8">
		<Image src={user.profileImageUrl} alt="Profile image" className="h-14 w-14 rounded-full" width={56} height={56} />
		<input placeholder="Type emojis" className=" grow bg-transparent outline-none" />
	</div>)
}

type PostWithUser = RouterOutputs['posts']['getAll'][number]

const PostView = (props: PostWithUser) => {
	const { post, author } = props;
	return (
		<div key={post.id} className="border-b border p-8 flex">
			<Image src={author.profilePic} className="h-14 w-14 rounded-full"
				alt={`@{author.username}'s profile picture`} width={56} height={56}
			/>
			<div className="flex flex-col">
				<div className="flex">
					<span>{`@${author.name!}`}</span>
					<span className="font-thin">{`  - ${dayjs(post.createdAt).fromNow()}`}</span>
				</div>
				<div className="flex p-2">
					<span className="text-2xl">
						{post.content}
					</span>
				</div>
			</div>
		</div>)
}


const Feed = () => {
	const { data, isLoading: postsLoading } = api.posts.getAll.useQuery()

	if (postsLoading) return <LoadingPage />

	if (!data) return <div>Somethign went wrong</div>

	return (
		<div className="flex flex-col">
		  {[...data, ...data]?.map((fullPost) => (
			<PostView {...fullPost} key={fullPost.post.id} />
			))}
		</div>
	)
};

const Home: NextPage = () => {
	const { isLoaded: userLoaded, isSignedIn } = useUser();

	api.posts.getAll.useQuery();

	if (!userLoaded) return <div />;

	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="flex h-screen justify-center">
				<div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
					<div className="flex border-b border-slate-400 p-4">
						{!isSignedIn && (
							<div className="flex justify-center">
								<SignInButton />
							</div>)}

					</div>
					<div>
						{isSignedIn && <CreatePostWizard />}
					</div>
					<Feed />
				</div>
			</main>
		</>
	);
};

export default Home;

const AuthShowcase: React.FC = () => {
	const { data: sessionData } = useSession();

	const { data: secretMessage } = api.posts.getSecretMessage.useQuery(
		undefined, // no input
		{ enabled: sessionData?.user !== undefined },
	);

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl text-white">
				{sessionData && <span>Logged in as {sessionData.user?.name}</span>}
				{secretMessage && <span> - {secretMessage}</span>}
			</p>
			<button
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				onClick={sessionData ? () => void signOut() : () => void signIn()}
			>
				{sessionData ? "Sign out" : "Sign in"}
			</button>
		</div>
	);
};

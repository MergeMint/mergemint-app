/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { processPR, type ProcessPRInput } from '~/lib/mergemint/pr-processor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orgId,
      repoId,
      repoFullName,
      prNumber,
      prId: githubPrId,
      prTitle,
      prBody,
      prAuthor,
      mergedAt,
      additions,
      deletions,
      changedFiles,
      headSha,
      baseSha,
      skipComment = false,
      postComment = !skipComment,
    } = body;

    if (!orgId || !repoFullName || !prNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, repoFullName, prNumber' },
        { status: 400 },
      );
    }

    const input: ProcessPRInput = {
      orgId,
      repoId,
      repoFullName,
      prNumber,
      prId: githubPrId,
      prTitle,
      prBody,
      prAuthor,
      prAuthorId: body.prAuthorId,
      prAuthorAvatar: body.prAuthorAvatar,
      prUrl: body.prUrl,
      mergedAt,
      createdAt: body.createdAt,
      additions,
      deletions,
      changedFiles,
      headSha,
      baseSha,
      postComment,
    };

    const result = await processPR(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      evaluation: result.evaluation,
      commentPosted: result.commentPosted,
    });
  } catch (err) {
    console.error('Error processing PR:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

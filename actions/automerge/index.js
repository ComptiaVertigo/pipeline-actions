module.exports = async ({github, context, core}) => {
    await checkReviews({github,context,core});
    await merge({github,context,core});
    await updatePullRequestState({github,context,core});
    await deleteBranch({github,context,core});
}

async function checkReviews({github,context,core}){
    const MAX_APPROVALS = process.env.MAX_APPROVALS;
    try{
        const { data : reviews } = await github.rest.pulls.listReviews({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.issue.number,
        });
        const approvingReviewers = reviews.filter(review => review.state === "APPROVED")
    
        if(!(approvingReviewers >=  MAX_APPROVALS)){
            core.setFailed(`Error: Approvals required ${MAX_APPROVALS}`);
        }
        console.log('Passed approvals');
        
    }catch(err){
        core.setFailed(`Error in checkReviews: ${err}`);  
    }
}

async function merge({github,context,core}){
    const METHOD = process.env.METHOD;
    try{
        await github.rest.pulls.merge({
            owner: context.repo.owner,
            repo: context.repo.repo,
            commit_title: context.payload.pull_request.title,
            pull_number: context.issue.number,
            commit_message: "",
            merge_method: METHOD
        });
        console.log(`Merge done`);

    }catch(err){
        core.setFailed(`Error in merge: ${err}`);
    }
}

async function updatePullRequestState({github,context,core}){
    try{
        await github.rest.pulls.update({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.issue.number,
            state: "closed"
        });
        console.log(`Pull request updated`);
    }catch(err){
        core.setFailed(`Error in updatePullRequestState: ${err}`);
    }   
}

async function deleteBranch({github,context,core}){
    try{
        await github.rest.git.deleteRef({
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: `heads/${context.payload.pull_request.head.ref}`,
        });
        console.log(`Branch deleted`);
    }catch(err){
        core.setFailed(`Error in deleteBranch: ${err}`);
    }
}
module.exports = async ({github, context, _}) => {
    const labels = process.env.LABELS.trim().split('\n');
    for(const label of labels){
        try{
            await github.rest.issues.removeLabel({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                name: label
            })
        }catch(err){
            console.log(`${label} not included`)
        }
    }
}
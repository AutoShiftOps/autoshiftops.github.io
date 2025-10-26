You can use them in your Markdown just like normal:

> This is a blockquote.

> **Note:** Important details here

Or use custom classes like {:.note} or {:.warning} to highlight callouts.

## Example Markdown Usage

> This is a normal blockquote for emphasizing a key takeaway.

<div class="callout info">
<strong>ℹ️ Info:</strong> Use GitHub Actions to automate your deployment process seamlessly.
</div>

<div class="callout note">
<strong>💡 Note:</strong> Terraform state files should never be stored in your repo. Use a remote backend.
</div>

<div class="callout warning">
<strong>⚠️ Warning:</strong> Check your IAM permissions before running this script in production.
</div>

<div class="callout danger">
<strong>🚨 Danger:</strong> This command will delete all running pods — proceed carefully!
</div>

For local testing
bundle install
bundle exec jekyll build
bundle exec jekyll serve --livereload
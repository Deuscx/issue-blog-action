# issue-blog-action

generate markdown files with github issues

## Usage

```yml
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: generate blog post
        uses: deuscx/issue-blog-action
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Inputs

- GH_TOKEN: authorization for commit file and get issues
  

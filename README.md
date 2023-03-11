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
        uses: Deuscx/issue-blog-action
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Inputs
env:
- GH_TOKEN: authorization for commit file and get issues

input:
- output: the post output directory
- alias: alias of yaml front-matter
- enableTag: generate blog by tag or milestone, default 'post'
  

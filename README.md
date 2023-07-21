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
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs
input:
- output: the post output directory
- alias: alias of yaml front-matter
- enableTag: generate blog by tag or milestone, default 'post'
  

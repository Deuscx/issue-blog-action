import { setFailed } from '@actions/core'
import { generateIssues } from './generate'

async function main() {
  try {
    await generateIssues()
  }
  catch (error) {
    setFailed((error as Error).message)
  }
}

main()

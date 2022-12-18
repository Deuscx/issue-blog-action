import * as core from '@actions/core'
interface InputTypes {
  cwd: string
}

export function getInput<T extends keyof InputTypes>(name: string): InputTypes[T] {
  return core.getInput(name)
}

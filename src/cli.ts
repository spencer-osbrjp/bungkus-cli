import { Command } from "commander";
import { runPrompts } from "./prompts";
import { scaffold } from "./scaffold";

export const cli = new Command()
  .name("create-bungkus")
  .description("Scaffold a frontend project with pre-configured tooling")
  .version("0.0.1")
  .argument("[project-name]", "Name of the project")
  .action(async (projectName?: string) => {
    const options = await runPrompts(projectName);
    await scaffold(options);
  });

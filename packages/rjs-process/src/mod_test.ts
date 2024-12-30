import { assertEquals } from "@std/assert";
import { add } from "./mod.ts";

Deno.test(function addedTest() {
  assertEquals(add(2, 3), 5);
});

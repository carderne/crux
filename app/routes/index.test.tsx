import { action } from "./index";

test("index action", async () => {
  const request = {
    formData: function () {
      return [["room", "fake-room"]];
    },
  };
  const response = await action({ request })
  .then((r: Response) => r.text())
  .then((r: string) => JSON.parse(r));
  expect(response).toHaveProperty("error");
});

describe("smoke tests", () => {
  afterEach(() => {
    //redis.flushall();
  });

  it("should allow you to create a room", () => {
    cy.visit("/");
    cy.findByRole("link", { name: /create/i }).click();
    cy.wait(200);
    cy.get("label input").type("This is a statement");
    cy.get("[type='submit']").click();
    cy.wait(50);
    cy.get("[type='submit']").click();
    cy.wait(50);
    cy.get("button").click();
    cy.findByText(`"Nobody matched!"`);

    cy.visit("/");
    cy.findByRole("textbox").type("fake-room");
    cy.findByRole("button").click();
  });

  it("should not allow you join a non-existing room", () => {
    cy.visit("/");
    cy.findByRole("textbox").type("fake-room");
    cy.findByRole("button").click();
    cy.get("div.visible").findByText("No such room!");
  });
});

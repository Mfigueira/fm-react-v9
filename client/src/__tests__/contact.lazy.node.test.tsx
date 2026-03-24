import { render } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Route } from "../routes/contact.lazy";

const queryClient = new QueryClient({});

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

test("can submit contact form", async () => {
  fetchMocker.mockResponse(JSON.stringify({ status: "ok" }));
  const ContactComponent = Route.options.component!;
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <ContactComponent />
    </QueryClientProvider>,
  );

  const nameInput = screen.getByPlaceholderText("Name") as HTMLInputElement;
  const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
  const msgTextArea = screen.getByPlaceholderText(
    "Message",
  ) as HTMLTextAreaElement;

  const testData = {
    name: "Brian",
    email: "test@example.com",
    message: "This is a test message",
  };

  nameInput.value = testData.name;
  emailInput.value = testData.email;
  msgTextArea.value = testData.message;

  const btn = screen.getByRole("button");

  btn.click();

  const h3 = await screen.findByRole("heading", { level: 3 });

  expect(h3.textContent).toContain("Submitted");

  const requests = fetchMocker.requests();
  expect(requests.length).toBe(1);
  expect(requests[0].url).toBe("/api/contact");
  expect(fetchMocker).toHaveBeenCalledWith("/api/contact", {
    body: JSON.stringify(testData),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
});

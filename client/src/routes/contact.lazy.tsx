import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import postContact from "../api/postContact";
import type { ContactResponse } from "../types";

interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export const Route = createLazyFileRoute("/contact")({
  component: ContactRoute,
});

function ContactRoute() {
  const mutation = useMutation<ContactResponse, Error, ContactFields>({
    mutationFn: ({ name, email, message }) =>
      postContact(name, email, message),
  });

  return (
    <div className="contact">
      <h2>Contact</h2>
      {mutation.isSuccess ? (
        <h3>Submitted!</h3>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            mutation.mutate({
              name: formData.get("name") as string,
              email: formData.get("email") as string,
              message: formData.get("message") as string,
            });
          }}
        >
          <input name="name" placeholder="Name" />
          <input type="email" name="email" placeholder="Email" />
          <textarea placeholder="Message" name="message"></textarea>
          <button>Submit</button>
        </form>
      )}
    </div>
  );
}

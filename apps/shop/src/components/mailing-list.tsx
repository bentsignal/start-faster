import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

type MailingListState = "idle" | "loading" | "success";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getButtonAriaLabel(status: MailingListState) {
  if (status === "loading") return "Submitting email";
  if (status === "success") return "Successfully subscribed";
  return "Subscribe";
}

function SubscribeButtonContent({ status }: { status: MailingListState }) {
  if (status === "loading") {
    return <Loader className="size-4 animate-spin" />;
  }

  if (status === "success") {
    return <Check className="size-4" />;
  }

  return <>Subscribe</>;
}

function MailingListForm({
  email,
  status,
  errorMessage,
  onEmailChange,
  onSubmit,
}: {
  email: string;
  status: MailingListState;
  errorMessage: string | null;
  onEmailChange: (nextEmail: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const isSubmitting = status !== "idle";

  return (
    <form
      className="border-input focus-within:border-ring focus-within:ring-ring/50 mx-auto flex max-w-sm rounded-4xl border transition-colors focus-within:ring-[3px]"
      onSubmit={onSubmit}
      noValidate
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Your email address"
        className="rounded-r-none border-0 focus-visible:border-transparent focus-visible:ring-0"
        disabled={isSubmitting}
        aria-invalid={errorMessage !== null}
      />
      <Button
        className="min-w-28 rounded-l-none data-[success=true]:bg-green-600 data-[success=true]:text-white data-[success=true]:hover:bg-green-600"
        disabled={isSubmitting || email.trim().length === 0}
        type="submit"
        aria-label={getButtonAriaLabel(status)}
        variant={status === "success" ? "default" : "outline"}
        data-success={status === "success"}
      >
        <SubscribeButtonContent status={status} />
      </Button>
    </form>
  );
}

export function MailingList() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<MailingListState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const isSubmitting = status !== "idle";

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setNextTimeout = (callback: () => void, delay: number) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(callback, delay);
  };

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);

    if (errorMessage === null) {
      return;
    }

    if (nextEmail.length === 0 || EMAIL_PATTERN.test(nextEmail.trim())) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || email.trim().length === 0) {
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage(null);
    setStatus("loading");

    setNextTimeout(() => {
      setStatus("success");

      setNextTimeout(() => {
        setEmail("");
        setStatus("idle");
      }, 2000);
    }, 1000);
  };

  return (
    <section className="border-border border-t py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.2em] uppercase">
          Stay in the loop
        </p>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          Join Our Community
        </h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Get early access to new drops, exclusive offers, and style inspiration
          delivered straight to your inbox.
        </p>
        <MailingListForm
          email={email}
          status={status}
          errorMessage={errorMessage}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
        {errorMessage !== null ? (
          <p className="mt-3 text-xs text-red-500">{errorMessage}</p>
        ) : null}
        <p className="text-muted-foreground mt-4 text-xs">
          We respect your privacy and will never share your information.
        </p>
      </div>
    </section>
  );
}

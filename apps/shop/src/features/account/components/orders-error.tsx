import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

function summarizeError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : null;

  if (message == null) {
    return null;
  }

  const normalizedMessage = message.replace(/\s+/g, " ").trim();
  if (normalizedMessage.length === 0) {
    return null;
  }

  const firstSentence =
    normalizedMessage.split(/(?<=[.!?])\s+/)[0] ?? normalizedMessage;
  const summary =
    firstSentence.length > 140
      ? `${firstSentence.slice(0, 137)}...`
      : firstSentence;

  return summary;
}

export function OrdersErrorComponent({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const errorSummary = summarizeError(error);

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>We couldn&apos;t load your orders</CardTitle>
        <CardDescription>
          An error occurred while fetching your order history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorSummary != null ? (
          <p className="text-muted-foreground text-sm">{errorSummary}</p>
        ) : null}
        {onRetry != null ? (
          <Button onClick={onRetry} variant="outline">
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

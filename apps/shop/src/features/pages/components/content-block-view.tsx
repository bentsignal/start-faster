export function ContentBlockView({ body }: { body: string }) {
  return (
    <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
      {body}
    </div>
  );
}

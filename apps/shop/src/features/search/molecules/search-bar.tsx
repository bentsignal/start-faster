import { ClearButton } from "../atoms/clear-button";
import { Container } from "../atoms/container";
import { Icon } from "../atoms/icon";
import { Input } from "../atoms/input";

function SearchBar({ className }: { className?: string }) {
  return (
    <Container className={className}>
      <Icon />
      <Input />
      <ClearButton />
    </Container>
  );
}

export { SearchBar };

import type { LegendListRenderItemProps } from "@legendapp/list";
import { Link } from "@tanstack/react-router";
import { LegendList } from "@legendapp/list";
import { Loader } from "lucide-react";

import type { UIProfile } from "@acme/convex/types";

import * as Profile from "~/features/profile/atom";
import { useSearchResults } from "../hooks/use-search-results";
import { SearchBar } from "./search-bar";

export function SearchPageResults() {
  const { results, resultsStatus, loadingStatus, loadMoreItems } =
    useSearchResults();

  const showLoadingSpinner =
    ["CanLoadMore", "LoadingFirstPage"].includes(loadingStatus) &&
    results.length > 15;

  return (
    <>
      <SearchBar />
      <LegendList
        data={results}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maintainVisibleContentPosition={true}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.75}
        recycleItems={true}
        ListHeaderComponent={<div className="mb-4" />}
        // @ts-expect-error - Web-only: CSS calc() works on web but RN types don't allow it
        style={{
          height: "calc(100dvh - 96px)",
        }}
        contentContainerStyle={{
          flex: 1,
        }}
        ListEmptyComponent={
          resultsStatus === "no-search-term-entered" ? (
            <div className="flex flex-1 items-center justify-center py-4">
              <p className="text-muted-foreground">
                Search for other users on Ruby
              </p>
            </div>
          ) : resultsStatus === "no-results-found" ? (
            <div className="flex flex-1 items-center justify-center py-4">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : null
        }
        ListFooterComponent={
          showLoadingSpinner ? (
            <div className="my-2 flex h-10 w-full items-center justify-center">
              <Loader className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="my-4 mb-36 flex w-full items-center justify-center" />
          )
        }
      />
    </>
  );
}

function renderItem(props: LegendListRenderItemProps<UIProfile>) {
  return <ProfileSearchItem {...props} />;
}

function keyExtractor(profile: UIProfile) {
  return profile.username;
}

function ProfileSearchItem({ item }: LegendListRenderItemProps<UIProfile>) {
  return (
    <Profile.Store profile={item}>
      <Link
        to="/$username"
        params={{ username: item.username }}
        preload="intent"
        className="hover:bg-muted/50 flex items-center gap-3 rounded-full px-4 py-3"
      >
        <Profile.PFP variant="sm" />
        <div className="flex flex-col">
          <Profile.Name className="text-base font-medium" />
          <Profile.Username className="text-sm" />
        </div>
      </Link>
    </Profile.Store>
  );
}

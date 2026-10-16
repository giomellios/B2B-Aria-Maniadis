import { getT } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, Skeleton } from "@/design-system";

export default async function ProfileLoading() {
  const t = (await getT()).account.profile;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl md:text-4xl">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex justify-center">
          <AlertCircle className="w-20 h-20 text-muted-foreground opacity-50" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
        </div>

        <p className="text-muted-foreground">
          Sorry, the page you're looking for doesn't exist or has been moved to a
          different location.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Go Home
            </Button>
          </Link>
          <Link href="/properties">
            <Button variant="outline" className="w-full sm:w-auto">
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

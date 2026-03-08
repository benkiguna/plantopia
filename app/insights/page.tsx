import { MobileShell } from "@/components/MobileShell";
import { Card, CardContent } from "@/components/ui";

export default function InsightsPage() {
  return (
    <MobileShell title="Insights">
      <div className="px-4 py-6 space-y-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-32 h-32 mb-6 bg-sky/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-16 h-16 text-sky"
            >
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-forest mb-2">
            No insights yet
          </h2>
          <p className="text-forest/60 max-w-xs">
            Add plants and track their health to get personalized insights and care recommendations.
          </p>
        </div>

        {/* Sample Insight Cards (hidden) */}
        <div className="hidden space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-light/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green text-lg">+</span>
                </div>
                <div>
                  <h3 className="font-semibold text-forest">Overall Health Up</h3>
                  <p className="text-sm text-forest/60">
                    Your garden&apos;s average health improved by 5% this week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileShell>
  );
}

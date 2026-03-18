'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, TrendingUp, BarChart3 } from 'lucide-react';

interface DayData {
  date: string;
  count: number;
}

interface PropertyBreakdown {
  propertyId: string;
  title: string;
  views: number;
  bookmarks: number;
}

interface AnalyticsData {
  viewsByDay: DayData[];
  bookmarksByDay: DayData[];
  totalViews30d: number;
  totalBookmarks30d: number;
  propertyBreakdown: PropertyBreakdown[];
}

const CHART_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const viewsData = data.viewsByDay.map((d) => ({
    date: formatDate(d.date),
    views: d.count,
  }));

  const bookmarksData = data.bookmarksByDay.map((d) => ({
    date: formatDate(d.date),
    bookmarks: d.count,
  }));

  // Merge views and bookmarks by date for combined chart
  const allDates = new Set([
    ...data.viewsByDay.map(d => d.date),
    ...data.bookmarksByDay.map(d => d.date),
  ]);
  const combinedData = Array.from(allDates)
    .sort()
    .map((date) => ({
      date: formatDate(date),
      views: data.viewsByDay.find(d => d.date === date)?.count || 0,
      bookmarks: data.bookmarksByDay.find(d => d.date === date)?.count || 0,
    }));

  // Conversion rate per property
  const conversionData = data.propertyBreakdown
    .filter(p => p.views > 0)
    .map(p => ({
      name: p.title.length > 20 ? p.title.substring(0, 20) + '…' : p.title,
      rate: Math.round((p.bookmarks / p.views) * 100),
      views: p.views,
      bookmarks: p.bookmarks,
    }));

  const hasData = data.totalViews30d > 0 || data.totalBookmarks30d > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Views (30d)</p>
                <p className="text-3xl font-bold text-sky-500">
                  {data.totalViews30d.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-sky-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bookmarks (30d)</p>
                <p className="text-3xl font-bold text-violet-500">
                  {data.totalBookmarks30d.toLocaleString()}
                </p>
              </div>
              <Heart className="h-8 w-8 text-violet-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg Conversion Rate
                </p>
                <p className="text-3xl font-bold text-emerald-500">
                  {data.totalViews30d > 0
                    ? `${Math.round((data.totalBookmarks30d / data.totalViews30d) * 100)}%`
                    : '—'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-1">No analytics data yet</p>
            <p className="text-sm">
              Views and bookmark data will appear here once users start
              interacting with your properties.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Views & Bookmarks Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Views & Bookmarks — Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="bookmarks"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Bookmarks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Per-Property Breakdown */}
          {data.propertyBreakdown.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart — Views per property */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Views by Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.propertyBreakdown.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="title"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          tickFormatter={(v: string) =>
                            v.length > 12 ? v.substring(0, 12) + '…' : v
                          }
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--card))',
                          }}
                        />
                        <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Views" />
                        <Bar dataKey="bookmarks" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bookmarks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie chart — Conversion rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inquiry Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {conversionData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={conversionData}
                            dataKey="rate"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, rate }) => `${name}: ${rate}%`}
                          >
                            {conversionData.map((_, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid hsl(var(--border))',
                              background: 'hsl(var(--card))',
                            }}
                            formatter={(value: number, name: string) => [
                              `${value}%`,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-muted-foreground">
                      <p>Not enough data for conversion rates</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import React, { useState, useMemo, useRef } from 'react';
import './SiteAnalyticsDashboardView.css';

/**
 * Custom SVG Bezier Spline Helper
 * Converts a sequence of points into a smooth cubic bezier SVG path string
 */
function getSmoothSplinePath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const WIDTH = 800;
const HEIGHT = 300;
const PADDING = { top: 20, right: 30, bottom: 40, left: 55 };
const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;

export function SiteAnalyticsDashboardView({
  data,
  _executeAction,
  setModal,
  timeRange = '30d',
  onRangeChange,
  loading = false,
  onRefresh,
}) {
  const [chartMode, setChartMode] = useState('area'); // 'area', 'bars', 'cumulative'
  const [activeSeries, setActiveSeries] = useState({
    likes: true,
    comments: true,
    reviews: true,
    revenue: false,
  });

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Safe fallback data
  const engagementTrends = useMemo(() => data?.engagementTrends || [], [data?.engagementTrends]);
  const totalUsers = data?.totalUsers ?? 0;
  const poemsPublished = data?.poemsPublished ?? 0;
  const activeCompetitions = data?.activeCompetitions ?? 0;
  const revenue = data?.revenue ?? 0;
  const marketplaceRevenue = data?.marketplaceRevenue ?? 0;
  const subscriptionRevenue = data?.subscriptionRevenue ?? 0;
  const totalLikes = data?.likes ?? 0;
  const totalComments = data?.comments ?? 0;
  const totalReviews = data?.reviews ?? 0;
  const totalViews = data?.views ?? 0;

  const categoryDistribution = data?.categoryDistribution || [];
  const languageDistribution = data?.languageDistribution || [];
  const activeCompetitionsList = data?.activeCompetitionsList || [];
  const topPoems = data?.topPoems || [];
  const userBreakdown = data?.userBreakdown || {};
  const recentActivity = data?.recentActivity || [];

  // Toggle specific series in chart
  const toggleSeries = (key) => {
    setActiveSeries((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount <= 1) return prev; // Keep at least one active
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Dimensions & bounds for responsive SVG
  const width = WIDTH;
  const height = HEIGHT;
  const padding = PADDING;
  const chartW = CHART_W;
  const chartH = CHART_H;

  // Maximum value for scaling
  const maxMetricVal = useMemo(() => {
    if (!engagementTrends || engagementTrends.length === 0) return 100;
    let max = 0;
    engagementTrends.forEach((pt) => {
      if (chartMode === 'cumulative') {
        if (activeSeries.likes) max = Math.max(max, pt.cumulativeLikes || 0);
        if (activeSeries.comments) max = Math.max(max, pt.cumulativeComments || 0);
        if (activeSeries.reviews) max = Math.max(max, pt.cumulativeReviews || 0);
        if (activeSeries.revenue) max = Math.max(max, Number(pt.cumulativeRevenue || 0));
      } else {
        if (activeSeries.likes) max = Math.max(max, pt.likes || 0);
        if (activeSeries.comments) max = Math.max(max, pt.comments || 0);
        if (activeSeries.reviews) max = Math.max(max, pt.reviews || 0);
        if (activeSeries.revenue) max = Math.max(max, Number(pt.revenue || 0));
      }
    });
    return max > 0 ? Math.ceil(max * 1.15) : 100;
  }, [engagementTrends, chartMode, activeSeries]);

  // Point coordinates calculation
  const pointCoordinates = useMemo(() => {
    if (!engagementTrends || engagementTrends.length === 0) return { likes: [], comments: [], reviews: [], revenue: [] };
    const len = engagementTrends.length;
    const step = len > 1 ? chartW / (len - 1) : chartW;

    const computeY = (val) => {
      const clamped = Math.max(0, val || 0);
      const ratio = clamped / maxMetricVal;
      return height - padding.bottom - ratio * chartH;
    };

    const likesPts = [];
    const commentsPts = [];
    const reviewsPts = [];
    const revenuePts = [];

    engagementTrends.forEach((pt, i) => {
      const x = padding.left + i * step;
      if (chartMode === 'cumulative') {
        likesPts.push({ x, y: computeY(pt.cumulativeLikes) });
        commentsPts.push({ x, y: computeY(pt.cumulativeComments) });
        reviewsPts.push({ x, y: computeY(pt.cumulativeReviews) });
        revenuePts.push({ x, y: computeY(Number(pt.cumulativeRevenue || 0)) });
      } else {
        likesPts.push({ x, y: computeY(pt.likes) });
        commentsPts.push({ x, y: computeY(pt.comments) });
        reviewsPts.push({ x, y: computeY(pt.reviews) });
        revenuePts.push({ x, y: computeY(Number(pt.revenue || 0)) });
      }
    });

    return { likes: likesPts, comments: commentsPts, reviews: reviewsPts, revenue: revenuePts };
  }, [engagementTrends, chartMode, maxMetricVal]);

  // Smooth Area Path Generators
  const areaPaths = useMemo(() => {
    const bottomY = height - padding.bottom;
    const generateArea = (pts) => {
      if (!pts || pts.length === 0) return '';
      const spline = getSmoothSplinePath(pts);
      const firstX = pts[0].x;
      const lastX = pts[pts.length - 1].x;
      return `${spline} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
    };

    return {
      likesLine: getSmoothSplinePath(pointCoordinates.likes),
      likesArea: generateArea(pointCoordinates.likes),
      commentsLine: getSmoothSplinePath(pointCoordinates.comments),
      commentsArea: generateArea(pointCoordinates.comments),
      reviewsLine: getSmoothSplinePath(pointCoordinates.reviews),
      reviewsArea: generateArea(pointCoordinates.reviews),
      revenueLine: getSmoothSplinePath(pointCoordinates.revenue),
      revenueArea: generateArea(pointCoordinates.revenue),
    };
  }, [pointCoordinates, height, padding.bottom]);

  // Mouse move handler for interactive cursor & tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || !engagementTrends.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to SVG coordinates
    const scaleX = width / rect.width;
    const svgX = mouseX * scaleX;

    const step = engagementTrends.length > 1 ? chartW / (engagementTrends.length - 1) : chartW;
    const rawIndex = Math.round((svgX - padding.left) / step);
    const clampedIndex = Math.max(0, Math.min(engagementTrends.length - 1, rawIndex));

    setHoveredIndex(clampedIndex);
    setTooltipPos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Export CSV summary
  const exportCsv = () => {
    if (!engagementTrends || !engagementTrends.length) return;
    const headers = ['Date', 'Day', 'Likes', 'Comments', 'Reviews', 'Views', 'Daily Revenue (INR)', 'Poems Published', 'New Users'];
    const rows = engagementTrends.map((pt) => [
      pt.date,
      pt.day || '',
      pt.likes ?? 0,
      pt.comments ?? 0,
      pt.reviews ?? 0,
      pt.views ?? 0,
      pt.revenue ?? 0,
      pt.poems ?? 0,
      pt.users ?? 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kavyakosh_engagement_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grid horizontal ticks (5 ticks)
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const val = Math.round((maxMetricVal / count) * i);
      const y = height - padding.bottom - (val / maxMetricVal) * chartH;
      ticks.push({ val, y });
    }
    return ticks;
  }, [maxMetricVal, chartH, height, padding.bottom]);

  // X-axis label spacing (max 7-8 evenly spaced labels)
  const xLabels = useMemo(() => {
    if (!engagementTrends.length) return [];
    const total = engagementTrends.length;
    const interval = Math.max(1, Math.floor(total / 6));
    const result = [];
    for (let i = 0; i < total; i += interval) {
      const step = total > 1 ? chartW / (total - 1) : chartW;
      result.push({
        label: engagementTrends[i].label,
        x: padding.left + i * step,
      });
    }
    // Ensure the last date is displayed
    if (result[result.length - 1].x < padding.left + chartW - 20) {
      result.push({
        label: engagementTrends[total - 1].label,
        x: padding.left + chartW,
      });
    }
    return result;
  }, [engagementTrends]);

  const activeHoverPoint = hoveredIndex !== null ? engagementTrends[hoveredIndex] : null;

  return (
    <div className="analytics-dashboard">
      {/* ── Top Header & Range Controls ── */}
      <div className="analytics-top-bar">
        <div className="analytics-title-group">
          <h2>
            <span>📊</span> Site-Wide Analytics & Intelligence
            <span className="live-badge">
              <span className="live-pulse" /> Live Telemetry
            </span>
          </h2>
          <p className="analytics-subtitle">
            Real-time engagement trends, platform performance, audience breakdown & revenue telemetry
          </p>
        </div>

        <div className="analytics-controls">
          <div className="range-pill-group">
            {[
              ['7d', '7 Days'],
              ['30d', '30 Days'],
              ['90d', '90 Days'],
              ['all', 'All Time'],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`range-pill ${timeRange === id ? 'active' : ''}`}
                onClick={() => onRangeChange?.(id)}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="btn-analytics-action" onClick={exportCsv} title="Export CSV Summary">
            📥 Export CSV
          </button>

          <button
            className="btn-analytics-action"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Real-time Data"
          >
            🔄 {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Top Executive KPI Cards ── */}
      <div className="kpi-grid">
        {/* Total Users */}
        <div className="kpi-card kpi-users">
          <div className="kpi-header">
            <span className="kpi-label">Total Users</span>
            <div className="kpi-icon-wrap">👥</div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{totalUsers.toLocaleString()}</span>
            <span className="kpi-trend-pill positive">
              {userBreakdown.active ? `${Math.round((userBreakdown.active / (totalUsers || 1)) * 100)}% Active` : 'Active'}
            </span>
          </div>
          <span className="kpi-subtext">Registered community members</span>
          <div className="kpi-meta-breakdown">
            <span className="kpi-meta-item">✍️ Writers: <strong>{userBreakdown.writers || 0}</strong></span>
            <span className="kpi-meta-item">⭐ Premium: <strong>{userBreakdown.premium || 0}</strong></span>
            <span className="kpi-meta-item">🛡️ Reviewers: <strong>{userBreakdown.reviewers || 0}</strong></span>
          </div>
        </div>

        {/* Poems Published */}
        <div className="kpi-card kpi-poems">
          <div className="kpi-header">
            <span className="kpi-label">Poems Published</span>
            <div className="kpi-icon-wrap">📜</div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{poemsPublished.toLocaleString()}</span>
            <span className="kpi-trend-pill">
              {totalViews > 0 ? `${(totalViews / 1000).toFixed(1)}k Views` : 'Live'}
            </span>
          </div>
          <span className="kpi-subtext">Original verses in explore feed</span>
          <div className="kpi-meta-breakdown">
            <span className="kpi-meta-item">
              Avg Likes: <strong>{poemsPublished > 0 ? Math.round(totalLikes / poemsPublished) : 0}</strong>
            </span>
            <span className="kpi-meta-item">
              Avg Comments: <strong>{poemsPublished > 0 ? (totalComments / poemsPublished).toFixed(1) : 0}</strong>
            </span>
          </div>
        </div>

        {/* Active Competitions */}
        <div className="kpi-card kpi-competitions">
          <div className="kpi-header">
            <span className="kpi-label">Active Competitions</span>
            <div className="kpi-icon-wrap">🏆</div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{activeCompetitions}</span>
            <span className="kpi-trend-pill positive">Live Challenges</span>
          </div>
          <span className="kpi-subtext">Community poetry tournaments</span>
          <div className="kpi-meta-breakdown">
            <span className="kpi-meta-item">
              Participants: <strong>
                {activeCompetitionsList.reduce((acc, c) => acc + (c.participantCount || 0), 0).toLocaleString()}
              </strong>
            </span>
            <span className="kpi-meta-item">
              Active: <strong>{activeCompetitionsList.length}</strong>
            </span>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="kpi-card kpi-revenue">
          <div className="kpi-header">
            <span className="kpi-label">Total Revenue</span>
            <div className="kpi-icon-wrap">💰</div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">₹{Number(revenue).toLocaleString()}</span>
            <span className="kpi-trend-pill positive">Combined</span>
          </div>
          <span className="kpi-subtext">Marketplace & premium subscriptions</span>
          <div className="kpi-meta-breakdown">
            <span className="kpi-meta-item">🛍️ Orders: <strong>₹{Number(marketplaceRevenue).toLocaleString()}</strong></span>
            <span className="kpi-meta-item">⭐ Subs: <strong>₹{Number(subscriptionRevenue).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Engagement Pulse */}
        <div className="kpi-card kpi-engagement">
          <div className="kpi-header">
            <span className="kpi-label">Engagement Pulse</span>
            <div className="kpi-icon-wrap">❤️</div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{(totalLikes + totalComments + totalReviews).toLocaleString()}</span>
            <span className="kpi-trend-pill positive">Total Reactions</span>
          </div>
          <span className="kpi-subtext">Likes, comments & literary critiques</span>
          <div className="kpi-meta-breakdown">
            <span className="kpi-meta-item">❤️ Likes: <strong>{totalLikes.toLocaleString()}</strong></span>
            <span className="kpi-meta-item">💬 Comments: <strong>{totalComments.toLocaleString()}</strong></span>
            <span className="kpi-meta-item">⭐ Reviews: <strong>{totalReviews.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Main Engagement Trends Chart Card ── */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3>📈 Engagement Trends Over Time</h3>
            <p className="chart-subtitle">
              Visual telemetry of audience interactions (likes, comments, reviews) pulled directly from existing database records
            </p>
          </div>

          <div className="chart-toolbar">
            {/* View Mode Switcher */}
            <div className="chart-type-toggles">
              <button
                className={`chart-type-btn ${chartMode === 'area' ? 'active' : ''}`}
                onClick={() => setChartMode('area')}
              >
                🌊 Area Curves
              </button>
              <button
                className={`chart-type-btn ${chartMode === 'bars' ? 'active' : ''}`}
                onClick={() => setChartMode('bars')}
              >
                📊 Daily Bars
              </button>
              <button
                className={`chart-type-btn ${chartMode === 'cumulative' ? 'active' : ''}`}
                onClick={() => setChartMode('cumulative')}
              >
                🚀 Cumulative
              </button>
            </div>

            {/* Interactive Series Legend */}
            <div className="chart-legend">
              <button
                className={`legend-item ${!activeSeries.likes ? 'disabled' : ''}`}
                onClick={() => toggleSeries('likes')}
                title="Toggle Likes"
              >
                <span className="legend-dot likes" />
                <span>Likes</span>
              </button>
              <button
                className={`legend-item ${!activeSeries.comments ? 'disabled' : ''}`}
                onClick={() => toggleSeries('comments')}
                title="Toggle Comments"
              >
                <span className="legend-dot comments" />
                <span>Comments</span>
              </button>
              <button
                className={`legend-item ${!activeSeries.reviews ? 'disabled' : ''}`}
                onClick={() => toggleSeries('reviews')}
                title="Toggle Reviews"
              >
                <span className="legend-dot reviews" />
                <span>Reviews</span>
              </button>
              <button
                className={`legend-item ${!activeSeries.revenue ? 'disabled' : ''}`}
                onClick={() => toggleSeries('revenue')}
                title="Toggle Revenue (INR)"
              >
                <span className="legend-dot revenue" />
                <span>Revenue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart Container */}
        <div
          className="chart-canvas-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="chart-svg"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Like Gradients */}
              <linearGradient id="likeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>

              {/* Comment Gradients */}
              <linearGradient id="commentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Review Gradients */}
              <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>

              {/* Revenue Gradients */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Y-Labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="500"
                >
                  {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(1)}k` : tick.val}
                </text>
              </g>
            ))}

            {/* X-Axis Labels */}
            {xLabels.map((lbl, i) => (
              <text
                key={i}
                x={lbl.x}
                y={height - 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize="11"
                fontWeight="500"
              >
                {lbl.label}
              </text>
            ))}

            {/* ── Area Mode ── */}
            {chartMode !== 'bars' && (
              <>
                {/* Area Fills */}
                {activeSeries.likes && <path d={areaPaths.likesArea} fill="url(#likeGradient)" />}
                {activeSeries.comments && <path d={areaPaths.commentsArea} fill="url(#commentGradient)" />}
                {activeSeries.reviews && <path d={areaPaths.reviewsArea} fill="url(#reviewGradient)" />}
                {activeSeries.revenue && <path d={areaPaths.revenueArea} fill="url(#revenueGradient)" />}

                {/* Stroke Lines */}
                {activeSeries.likes && (
                  <path
                    d={areaPaths.likesLine}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {activeSeries.comments && (
                  <path
                    d={areaPaths.commentsLine}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {activeSeries.reviews && (
                  <path
                    d={areaPaths.reviewsLine}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {activeSeries.revenue && (
                  <path
                    d={areaPaths.revenueLine}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </>
            )}

            {/* ── Grouped Column Bars Mode ── */}
            {chartMode === 'bars' && (
              <g>
                {engagementTrends.map((pt, i) => {
                  const step = engagementTrends.length > 1 ? chartW / (engagementTrends.length - 1) : chartW;
                  const centerX = padding.left + i * step;
                  const barWidth = Math.max(3, Math.min(16, (step * 0.7) / 3));
                  const bottomY = height - padding.bottom;

                  const computeBarH = (val) => {
                    const ratio = Math.max(0, val || 0) / maxMetricVal;
                    return Math.max(2, ratio * chartH);
                  };

                  const likesH = computeBarH(pt.likes);
                  const commentsH = computeBarH(pt.comments);
                  const reviewsH = computeBarH(pt.reviews);

                  return (
                    <g key={i} opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.45}>
                      {activeSeries.likes && (
                        <rect
                          x={centerX - barWidth * 1.5}
                          y={bottomY - likesH}
                          width={barWidth}
                          height={likesH}
                          fill="#f43f5e"
                          rx="2"
                        />
                      )}
                      {activeSeries.comments && (
                        <rect
                          x={centerX - barWidth * 0.5}
                          y={bottomY - commentsH}
                          width={barWidth}
                          height={commentsH}
                          fill="#06b6d4"
                          rx="2"
                        />
                      )}
                      {activeSeries.reviews && (
                        <rect
                          x={centerX + barWidth * 0.5}
                          y={bottomY - reviewsH}
                          width={barWidth}
                          height={reviewsH}
                          fill="#8b5cf6"
                          rx="2"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* ── Active Hover Crosshair Line & Highlight Dots ── */}
            {hoveredIndex !== null && pointCoordinates.likes[hoveredIndex] && (
              <g>
                {/* Vertical Guideline */}
                <line
                  x1={pointCoordinates.likes[hoveredIndex].x}
                  y1={padding.top}
                  x2={pointCoordinates.likes[hoveredIndex].x}
                  y2={height - padding.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Likes Circle */}
                {activeSeries.likes && (
                  <g>
                    <circle
                      cx={pointCoordinates.likes[hoveredIndex].x}
                      cy={pointCoordinates.likes[hoveredIndex].y}
                      r="10"
                      fill="rgba(244, 63, 94, 0.2)"
                    />
                    <circle
                      cx={pointCoordinates.likes[hoveredIndex].x}
                      cy={pointCoordinates.likes[hoveredIndex].y}
                      r="4.5"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Comments Circle */}
                {activeSeries.comments && (
                  <g>
                    <circle
                      cx={pointCoordinates.comments[hoveredIndex].x}
                      cy={pointCoordinates.comments[hoveredIndex].y}
                      r="10"
                      fill="rgba(6, 182, 212, 0.2)"
                    />
                    <circle
                      cx={pointCoordinates.comments[hoveredIndex].x}
                      cy={pointCoordinates.comments[hoveredIndex].y}
                      r="4.5"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Reviews Circle */}
                {activeSeries.reviews && (
                  <g>
                    <circle
                      cx={pointCoordinates.reviews[hoveredIndex].x}
                      cy={pointCoordinates.reviews[hoveredIndex].y}
                      r="10"
                      fill="rgba(139, 92, 246, 0.2)"
                    />
                    <circle
                      cx={pointCoordinates.reviews[hoveredIndex].x}
                      cy={pointCoordinates.reviews[hoveredIndex].y}
                      r="4.5"
                      fill="#8b5cf6"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </g>
            )}
          </svg>

          {/* Floating Tooltip Card */}
          {hoveredIndex !== null && activeHoverPoint && (
            <div
              className="chart-tooltip-box"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${Math.max(20, tooltipPos.y)}px`,
              }}
            >
              <div className="tooltip-header">
                <span>{activeHoverPoint.label}</span>
                <span>{activeHoverPoint.day}</span>
              </div>

              {activeSeries.likes && (
                <div className="tooltip-row">
                  <span className="tooltip-row-label">
                    <span className="legend-dot likes" /> Likes:
                  </span>
                  <span className="tooltip-row-val" style={{ color: '#f43f5e' }}>
                    {chartMode === 'cumulative' ? activeHoverPoint.cumulativeLikes : activeHoverPoint.likes}
                  </span>
                </div>
              )}

              {activeSeries.comments && (
                <div className="tooltip-row">
                  <span className="tooltip-row-label">
                    <span className="legend-dot comments" /> Comments:
                  </span>
                  <span className="tooltip-row-val" style={{ color: '#06b6d4' }}>
                    {chartMode === 'cumulative' ? activeHoverPoint.cumulativeComments : activeHoverPoint.comments}
                  </span>
                </div>
              )}

              {activeSeries.reviews && (
                <div className="tooltip-row">
                  <span className="tooltip-row-label">
                    <span className="legend-dot reviews" /> Reviews:
                  </span>
                  <span className="tooltip-row-val" style={{ color: '#8b5cf6' }}>
                    {chartMode === 'cumulative' ? activeHoverPoint.cumulativeReviews : activeHoverPoint.reviews}
                  </span>
                </div>
              )}

              {activeHoverPoint.revenue > 0 && (
                <div className="tooltip-row">
                  <span className="tooltip-row-label">
                    <span className="legend-dot revenue" /> Revenue:
                  </span>
                  <span className="tooltip-row-val" style={{ color: '#10b981' }}>
                    ₹{activeHoverPoint.revenue}
                  </span>
                </div>
              )}

              <div className="tooltip-footer">
                <span>Daily Interactions:</span>
                <span>
                  {(activeHoverPoint.likes || 0) + (activeHoverPoint.comments || 0) + (activeHoverPoint.reviews || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-Column Analytical Breakdown ── */}
      <div className="insights-row">
        {/* Poetic Forms & Category Distribution */}
        <div className="panel-card">
          <h4>
            <span>📜 Genre & Form Distribution</span>
            <small>{categoryDistribution.length} Active Categories</small>
          </h4>

          <div className="distribution-list">
            {categoryDistribution.map((item) => {
              const catLower = item.category?.toLowerCase() || '';
              const colorClass = catLower.includes('ghazal')
                ? 'color-ghazal'
                : catLower.includes('nazm')
                ? 'color-nazm'
                : catLower.includes('doha')
                ? 'color-doha'
                : catLower.includes('free')
                ? 'color-freeverse'
                : catLower.includes('sher')
                ? 'color-sher'
                : 'color-kavita';

              return (
                <div className="dist-item" key={item.category}>
                  <div className="dist-info">
                    <span>{item.category}</span>
                    <span>
                      {item.count} poems ({item.percentage}%)
                    </span>
                  </div>
                  <div className="dist-bar-track">
                    <div className={`dist-bar-fill ${colorClass}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="language-tags-grid">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Languages:</span>
            {languageDistribution.map((lang) => (
              <span className="lang-tag" key={lang.language}>
                🌐 {lang.language}: <strong>{lang.count}</strong> ({lang.percentage}%)
              </span>
            ))}
          </div>
        </div>

        {/* Revenue Velocity & Stream Breakdown */}
        <div className="panel-card">
          <h4>
            <span>💳 Revenue Telemetry</span>
            <small>Marketplace & Subscriptions</small>
          </h4>

          <div className="revenue-summary-box">
            <div className="revenue-big-stat">
              <span>Gross Platform Volume</span>
              <strong>₹{Number(revenue).toLocaleString()}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Active Subscribers</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>
                {(userBreakdown.premium || 0) + 4} Accounts
              </div>
            </div>
          </div>

          <div className="revenue-split-bars">
            <div className="split-row">
              <span className="split-row-name">🛍️ Marketplace Orders (Books/Prints/Merch)</span>
              <span className="split-row-val">₹{Number(marketplaceRevenue).toLocaleString()}</span>
            </div>
            <div className="split-row">
              <span className="split-row-name">⭐ Recurring Subscriptions (LITE ₹199 / PRO ₹499)</span>
              <span className="split-row-val">₹{Number(subscriptionRevenue).toLocaleString()}</span>
            </div>
            <div className="split-row">
              <span className="split-row-name">📦 Completed Orders Count</span>
              <span className="split-row-val">{data?.revenueBreakdown?.completedOrdersCount ?? 8}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Competitions & Top Literature Row ── */}
      <div className="insights-row">
        {/* Active Competitions Arena */}
        <div className="panel-card">
          <h4>
            <span>🏆 Active Competitions Arena</span>
            <small>{activeCompetitionsList.length} Live Tournaments</small>
          </h4>

          <div className="competitions-mini-grid">
            {activeCompetitionsList.map((comp) => (
              <div className="comp-item" key={comp.id}>
                <div className="comp-info">
                  <span className="comp-title">{comp.title}</span>
                  <span className="comp-theme">Theme: {comp.theme}</span>
                  {comp.prizeDescription && (
                    <small style={{ color: '#059669', fontWeight: '600', fontSize: '11px' }}>
                      🎁 {comp.prizeDescription}
                    </small>
                  )}
                </div>
                <div className="comp-meta">
                  <span className="comp-participants">👥 {comp.participantCount?.toLocaleString()} Poets</span>
                  <span className="days-left-badge">{comp.daysLeft}d left</span>
                </div>
              </div>
            ))}

            {activeCompetitionsList.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '20px 0', textAlign: 'center' }}>
                No active competitions currently running.
              </p>
            )}
          </div>
        </div>

        {/* Top Engaged Literature Leaderboard */}
        <div className="panel-card">
          <h4>
            <span>🔥 Top Engaged Poems</span>
            <small>By Reactions & Views</small>
          </h4>

          <table className="top-poems-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>#</th>
                <th>Poem / Author</th>
                <th>Genre</th>
                <th style={{ textAlign: 'right' }}>Reactions</th>
              </tr>
            </thead>
            <tbody>
              {topPoems.map((p, idx) => (
                <tr key={p.id}>
                  <td>
                    <span className={`rank-pill rank-${idx + 1 <= 3 ? idx + 1 : 'other'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="poem-title-cell">
                    <strong>{p.title}</strong>
                    <small>by @{p.author}</small>
                  </td>
                  <td>
                    <span className="lang-tag" style={{ padding: '2px 6px', fontSize: '10.5px' }}>
                      {p.category || 'Verse'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="metric-pill">❤️ {p.likesCount?.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live Telemetry Activity Stream & Quick Actions ── */}
      <div className="insights-row">
        {/* Recent Platform Activity */}
        <div className="panel-card">
          <h4>
            <span>⚡ Recent Telemetry Stream</span>
            <small>Audit & Interactions</small>
          </h4>

          <div className="activity-feed">
            {recentActivity.map((act, i) => (
              <div className="activity-item" key={i}>
                <span className="activity-badge">
                  {act.type === 'REVIEW' ? '✍️' : act.type === 'COMMENT' ? '💬' : '🛍️'}
                </span>
                <div className="activity-body">
                  <span className="activity-desc">{act.title}</span>
                  <span className="activity-actor">
                    by <strong>@{act.actor}</strong> • {act.status ? `[${act.status}]` : 'Verified event'}
                  </span>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '14px 0' }}>
                Live activity recording in progress...
              </p>
            )}
          </div>
        </div>

        {/* Administrative Quick Actions */}
        <div className="panel-card" style={{ justifyContent: 'center' }}>
          <h4>
            <span>⚡ Quick Governance Actions</span>
            <small>Admin Shortcut Bar</small>
          </h4>

          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
            Instant administrative interventions for content governance, competition launches, and catalogue management.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="action-btn-pill"
              style={{ background: '#0284c7' }}
              onClick={() => setModal?.({ type: 'CREATE_COMPETITION' })}
            >
              🏆 Create New Competition
            </button>
            <button
              className="action-btn-pill"
              style={{ background: '#059669' }}
              onClick={() => setModal?.({ type: 'ADD_LISTING' })}
            >
              🛍️ Add Marketplace Listing
            </button>
            <button
              className="action-btn-pill"
              style={{ background: '#e11d48' }}
              onClick={() => setModal?.({ type: 'MANUAL_FLAG' })}
            >
              🚩 Flag / Moderate Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

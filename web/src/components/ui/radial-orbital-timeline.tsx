"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = getRelatedItems(id);
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => { newPulse[relId] = true; });
        setPulseEffect(newPulse);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRotate) {
      timer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
      }, 50);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const targetAngle = (nodeIndex / timelineData.length) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 160;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const item = timelineData.find((i) => i.id === itemId);
    return item ? item.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed": return "bg-[#57737a] text-white border-[#85bdbf]";
      case "in-progress": return "bg-[#c2fcf7] text-[#040f0f] border-[#85bdbf]";
      case "pending": return "bg-[#040f0f]/60 text-[#85bdbf] border-[#57737a]";
      default: return "bg-[#040f0f]/40 text-[#85bdbf] border-[#57737a]";
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Center Core */}
          <div className="absolute w-14 h-14 rounded-full flex items-center justify-center z-10"
            style={{ background: 'linear-gradient(135deg, #85bdbf, #57737a, #c2fcf7)' }}
          >
            <div className="absolute w-18 h-18 rounded-full border animate-ping opacity-70"
              style={{ borderColor: 'rgba(133, 189, 191, 0.3)', width: '72px', height: '72px' }}
            />
            <div className="absolute rounded-full border animate-ping opacity-40"
              style={{ borderColor: 'rgba(194, 252, 247, 0.2)', width: '88px', height: '88px', animationDelay: '0.5s' }}
            />
            <div className="w-7 h-7 rounded-full backdrop-blur-md" style={{ backgroundColor: 'rgba(194, 252, 247, 0.8)' }} />
          </div>

          {/* Orbit Ring */}
          <div className="absolute rounded-full" style={{ width: '320px', height: '320px', border: '1px solid rgba(133, 189, 191, 0.15)' }} />

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
              >
                {/* Glow */}
                <div
                  className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse" : ""}`}
                  style={{
                    background: 'radial-gradient(circle, rgba(133,189,191,0.2) 0%, transparent 70%)',
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                {/* Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isExpanded ? "scale-150" : ""}`}
                  style={{
                    backgroundColor: isExpanded ? '#c2fcf7' : isRelated ? 'rgba(194,252,247,0.3)' : '#040f0f',
                    color: isExpanded ? '#040f0f' : isRelated ? '#040f0f' : '#85bdbf',
                    borderColor: isExpanded ? '#c2fcf7' : isRelated ? '#85bdbf' : 'rgba(133,189,191,0.4)',
                    boxShadow: isExpanded ? '0 0 20px rgba(194,252,247,0.3)' : 'none',
                  }}
                >
                  <Icon size={16} />
                </div>

                {/* Label */}
                <div
                  className="absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300"
                  style={{ color: isExpanded ? '#c2fcf7' : 'rgba(133,189,191,0.7)' }}
                >
                  {item.title}
                </div>

                {/* Expanded Card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 backdrop-blur-lg overflow-visible shadow-xl"
                    style={{ backgroundColor: 'rgba(4,15,15,0.95)', borderColor: 'rgba(133,189,191,0.3)' }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3" style={{ backgroundColor: 'rgba(133,189,191,0.5)' }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                          {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono" style={{ color: 'rgba(133,189,191,0.5)' }}>{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-2" style={{ color: '#c2fcf7' }}>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs" style={{ color: 'rgba(194,252,247,0.8)' }}>
                      <p>{item.content}</p>
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(133,189,191,0.1)' }}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center" style={{ color: '#85bdbf' }}>
                            <Zap size={10} className="mr-1" /> Progress
                          </span>
                          <span className="font-mono" style={{ color: '#c2fcf7' }}>{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(133,189,191,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: `${item.energy}%`, background: 'linear-gradient(to right, #57737a, #85bdbf)' }} />
                        </div>
                      </div>
                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(133,189,191,0.1)' }}>
                          <div className="flex items-center mb-2">
                            <Link size={10} className="mr-1" style={{ color: '#57737a' }} />
                            <h4 className="text-xs uppercase tracking-wider font-medium" style={{ color: '#57737a' }}>Connected</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const rel = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button key={relatedId} variant="outline" size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none transition-all"
                                  style={{ borderColor: 'rgba(133,189,191,0.2)', backgroundColor: 'transparent', color: '#85bdbf' }}
                                  onClick={(e) => { e.stopPropagation(); toggleItem(relatedId); }}
                                >
                                  {rel?.title}<ArrowRight size={8} className="ml-1" style={{ color: 'rgba(133,189,191,0.6)' }} />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

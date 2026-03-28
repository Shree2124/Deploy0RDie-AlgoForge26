"use client";
import React from "react";
import { motion } from "motion/react";
import { MapPin, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

export type AuditItem = {
    description: string;
    image: string;
    location: string;
    risk: "High Risk" | "Medium Risk" | "Verified";
    date: string;
};

export const AuditColumn = (props: {
    className?: string;
    audits: AuditItem[];
    duration?: number;
}) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2).fill(0)].map((_, index) => (
                    <React.Fragment key={index}>
                        {props.audits.map(({ description, image, location, risk, date }, i) => {
                            // Set colors based on risk level for visual impact
                            const riskColor =
                                risk === "High Risk" ? "text-red-600 bg-red-50" :
                                    risk === "Medium Risk" ? "text-yellow-600 bg-yellow-50" :
                                        "text-green-600 bg-green-50";

                            const RiskIcon =
                                risk === "High Risk" ? ShieldAlert :
                                    risk === "Medium Risk" ? AlertTriangle :
                                        ShieldCheck;

                            return (
                                <div
                                    className="p-6 rounded-3xl border shadow-sm max-w-xs w-full flex flex-col gap-4"
                                    key={i}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderColor: '#b0d8db',
                                        color: '#040f0f'
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${riskColor}`}>
                                            <RiskIcon size={12} />
                                            {risk}
                                        </span>
                                        <span className="text-xs" style={{ color: '#57737a' }}>{date}</span>
                                    </div>

                                    <div className="text-sm font-medium leading-relaxed">
                                        "{description}"
                                    </div>

                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: '#e0f7f9' }}>
                                        <img
                                            src={image}
                                            alt={location}
                                            className="h-10 w-10 rounded-lg object-cover border"
                                            style={{ borderColor: '#b0d8db' }}
                                        />
                                        <div className="flex flex-col">
                                            <div className="font-semibold text-sm flex items-center gap-1">
                                                <MapPin size={12} style={{ color: '#57737a' }} />
                                                {location}
                                            </div>
                                            <div className="text-xs" style={{ color: '#57737a' }}>AI Verified Report</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};
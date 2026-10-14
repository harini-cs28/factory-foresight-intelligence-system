import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { maintenanceApi } from "../../api/maintenanceApi";
import { RecommendationResponse } from "../../types/maintenance";
import { Navigation } from "../layout/Navigation";
import { RecommendationCard } from "./RecommendationCard";
import { DecisionFactors } from "./DecisionFactors";
import { RecommendationHistory } from "./RecommendationHistory";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { Wrench, RefreshCw, Cpu, Share2 } from "lucide-react";

export const MaintenanceRecommendation: React.FC = () => {
  const { machineId = "M01" } = useParams<{ machineId: string }>();

  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await maintenanceApi.getRecommendation(machineId);
      setRecommendation(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          `Unable to generate maintenance recommendation for machine '${machineId}'.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [machineId]);

  if (isLoading) {
    return <LoadingState message={`Evaluating maintenance decision logic for machine ${machineId}...`} />;
  }

  if (error || !recommendation) {
    return (
      <ErrorState
        title="Maintenance Engine Unavailable"
        message={error || `Could not evaluate recommendation for machine '${machineId}'.`}
        onRetry={fetchRecommendation}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <Navigation machineId={machineId} />

      {/* Main Prescriptive Recommendation */}
      <RecommendationCard recommendation={recommendation} />

      {/* Decision Factors Matrix */}
      <DecisionFactors factors={recommendation.decision_factors} />

      {/* Past Recommendation History */}
      <RecommendationHistory machineId={machineId} />
    </div>
  );
};

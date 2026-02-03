export interface DeploymentAgeInfo {
  daysSinceDeployment: number;
  isCompliant: boolean;
  hasDeploymentInfo: boolean;
}

export function calculateDeploymentAge(
  lastDeploy: string | undefined,
  maxAgeDays: number
): DeploymentAgeInfo {
  if (!lastDeploy) {
    return {
      daysSinceDeployment: 0,
      isCompliant: true,
      hasDeploymentInfo: false,
    };
  }

  try {
    const deployDate = new Date(lastDeploy);
    
    // Check if date is valid
    if (isNaN(deployDate.getTime())) {
      console.error("Invalid date format for lastDeploy:", lastDeploy);
      return {
        daysSinceDeployment: 0,
        isCompliant: true,
        hasDeploymentInfo: false,
      };
    }

    const now = new Date();
    const diffTime = now.getTime() - deployDate.getTime();
    const daysSinceDeployment = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysSinceDeployment,
      isCompliant: daysSinceDeployment <= maxAgeDays,
      hasDeploymentInfo: true,
    };
  } catch (error) {
    console.error("Failed to parse lastDeploy date:", lastDeploy, error);
    return {
      daysSinceDeployment: 0,
      isCompliant: true,
      hasDeploymentInfo: false,
    };
  }
}

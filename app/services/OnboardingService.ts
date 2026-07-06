// app/services/OnboardingService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface InterestTag {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export const OnboardingService = {
  getOptions: () => api.get<{ data: { tags: InterestTag[] } }>("/api/onboarding/interests"),
  submit: (tagIds: string[]) => api.post<{ data: { saved: boolean } }>("/api/onboarding/interests", { tagIds }),
};
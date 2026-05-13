import { Routes, routeTo } from '@/routes';

describe('Routes constants', () => {
  it('has the expected static routes', () => {
    expect(Routes.login).toBe('/(auth)/login');
    expect(Routes.teacherHome).toBe('/(teacher)/home');
    expect(Routes.serverHome).toBe('/(server)/home');
    expect(Routes.adminDashboard).toBe('/(admin)/dashboard');
  });

  it('all values are strings starting with /', () => {
    Object.values(Routes).forEach((path) => {
      expect(typeof path).toBe('string');
      expect(path.startsWith('/')).toBe(true);
    });
  });
});

describe('routeTo builders', () => {
  it('teacherCourseDetail formats with id', () => {
    expect(routeTo.teacherCourseDetail(42)).toBe('/(teacher)/courses/42');
    expect(routeTo.teacherCourseDetail('abc')).toBe('/(teacher)/courses/abc');
  });

  it('teacherApplicationBrief formats with id', () => {
    expect(routeTo.teacherApplicationBrief(7)).toBe('/(teacher)/applications/brief/7');
  });

  it('onboardingTeacher formats with step number', () => {
    expect(routeTo.onboardingTeacher(1)).toBe('/onboarding/teacher/1');
    expect(routeTo.onboardingTeacher(5)).toBe('/onboarding/teacher/5');
  });

  it('admin builders produce correct paths', () => {
    expect(routeTo.adminApplicationReview(99)).toBe('/(admin)/inbox/99');
    expect(routeTo.adminCentreDetail('dhamma-shringa')).toBe('/(admin)/centres/dhamma-shringa');
  });

  it('server builders produce correct paths', () => {
    expect(routeTo.serverOpportunityDetail(3)).toBe('/(server)/opportunities/3');
    expect(routeTo.serverApplicationDetail(8)).toBe('/(server)/applications/8');
  });
});

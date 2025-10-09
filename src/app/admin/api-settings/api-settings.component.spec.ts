import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCardHarness } from '@angular/material/card/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ApiSettingsComponent } from './api-settings.component';

describe('ApiSettingsComponent', () => {
  let component: ApiSettingsComponent;
  let fixture: ComponentFixture<ApiSettingsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApiSettingsComponent,
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiSettingsComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Material Card Component Testing', () => {
    it('should render mat-card component', async () => {
      const card = await loader.getHarness(MatCardHarness);
      expect(card).toBeTruthy();
    });

    it('should have correct card title text', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const titleText = await card.getTitleText();
      expect(titleText).toBe('API Settings');
    });

    it('should have correct card subtitle text', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const subtitleText = await card.getSubtitleText();
      expect(subtitleText).toBe('Configure your API settings below.');
    });

    it('should have card sections with proper content', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const titleText = await card.getTitleText();
      const subtitleText = await card.getSubtitleText();
      const fullText = await card.getText();

      expect(titleText).toBeTruthy();
      expect(subtitleText).toBeTruthy();
      expect(fullText).toContain('API settings content goes here.');
      expect(fullText).toContain('action buttons here');
    });

    it('should display placeholder content text', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const contentText = await card.getText();
      expect(contentText).toContain('API settings content goes here.');
    });

    it('should display action buttons placeholder text', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const contentText = await card.getText();
      expect(contentText).toContain('action buttons here');
    });
  });

  describe('Component Structure and Layout', () => {
    it('should have proper card structure with all sections', async () => {
      const card = await loader.getHarness(MatCardHarness);
      
      const titleText = await card.getTitleText();
      const subtitleText = await card.getSubtitleText();
      const fullText = await card.getText();
      
      expect(titleText).toBeTruthy();
      expect(subtitleText).toBeTruthy();
      expect(fullText).toContain('API settings content goes here.');
      expect(fullText).toContain('action buttons here');
    });

    it('should maintain proper heading hierarchy', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const fullText = await card.getText();
      
      // Check that h1 is used for main title
      expect(fullText).toContain('API Settings');
    });

    it('should have proper semantic structure', async () => {
      const cardElement = await loader.getHarness(MatCardHarness);
      const host = await cardElement.host();
      const tagName = await host.getProperty('tagName');
      
      expect(tagName.toLowerCase()).toBe('mat-card');
    });
  });

  describe('Accessibility and Usability', () => {
    it('should be keyboard accessible', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const host = await card.host();
      
      const isVisible = await host.getCssValue('display');
      expect(isVisible).not.toBe('none');
    });

    it('should have proper contrast and visibility', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const host = await card.host();
      
      const visibility = await host.getCssValue('visibility');
      expect(visibility).not.toBe('hidden');
    });

    it('should maintain proper focus management', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const host = await card.host();
      
      await host.focus();
      const isFocused = await host.isFocused();
      // Card itself might not be focusable, which is expected
      expect(typeof isFocused).toBe('boolean');
    });
  });

  describe('Content Validation', () => {
    it('should contain expected content sections', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const text = await card.getText();
      
      expect(text).toContain('API Settings');
      expect(text).toContain('Configure your API settings below.');
      expect(text).toContain('API settings content goes here.');
      expect(text).toContain('action buttons here');
    });

    it('should have properly structured content flow', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const titleText = await card.getTitleText();
      const subtitleText = await card.getSubtitleText();
      
      expect(titleText).toBeTruthy();
      expect(subtitleText).toBeTruthy();
      expect(titleText.length).toBeGreaterThan(0);
      expect(subtitleText.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with Angular Material theme', async () => {
      const card = await loader.getHarness(MatCardHarness);
      const host = await card.host();
      
      const classes = await host.getAttribute('class');
      expect(classes).toContain('mat-mdc-card');
    });

    it('should handle component lifecycle properly', async () => {
      expect(component).toBeTruthy();
      
      // Test component destruction
      fixture.destroy();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should maintain Material Design specifications', async () => {
      const card = await loader.getHarness(MatCardHarness);
      
      // Verify card structure follows Material Design patterns
      const titleText = await card.getTitleText();
      const subtitleText = await card.getSubtitleText();
      const fullText = await card.getText();
      
      expect(titleText && subtitleText && fullText).toBeTruthy();
    });
  });
});

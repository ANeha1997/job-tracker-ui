import { TestBed } from '@angular/core/testing';
import { ApplicationsComponent } from './applications';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ApplicationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone component + needed testing modules
      imports: [
        ApplicationsComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ApplicationsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have jobId control', () => {
    const fixture = TestBed.createComponent(ApplicationsComponent);
    const component = fixture.componentInstance;
    expect(component.form.contains('jobId')).toBe(true);  // or toBeTruthy()
  });
});

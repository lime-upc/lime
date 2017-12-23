import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyUsersComponent } from './nearby-users.component';

describe('HomeComponent', () => {
  let component: NearbyUsersComponent;
  let fixture: ComponentFixture<NearbyUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

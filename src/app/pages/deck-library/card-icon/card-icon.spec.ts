import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardIcon } from './card-icon';

describe('CardIcon', () => {
  let component: CardIcon;
  let fixture: ComponentFixture<CardIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

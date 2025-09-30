import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
  AUTO_STYLE,
} from '@angular/animations';

export const fadeAwayAnimation = trigger('animationTrigger', [
  state('visible', style({ opacity: 1 })),
  state('invisible', style({ opacity: 0 })),
  transition('invisible => visible', [
    style({ opacity: 0 }),
    animate('200ms linear'),
  ]),
  state(
    'shake',
    style({
      transform: 'translateX(0) rotate(0)',
      color: '#fed640',
    }),
  ),
  transition('visible => shake', [
    animate('200ms linear', style({ color: '#fffff' })),
    animate('200ms linear', style({ color: '#fed640' })),
    animate('200ms linear', style({ color: '#fffff' })),
  ]),
  transition('shake => invisible', [animate('200ms ease-out')]),
]);

export const baseIncrementAnimation = trigger('baseIncrementAnimation', [
  transition(':increment', [
    style({ color: '#fed640', fontWeight: '500' }),
    animate('1s ease-out', style('*')),
  ]),
]);

export const levelAnimation = trigger('levelAnimation', [
  transition(':increment', [
    style({ color: '#fed640', fontWeight: '700' }),
    animate(
      '1.2s ease-out',
      keyframes([
        style({
          visibility: AUTO_STYLE,
          transform: 'scale3d(1, 1, 1)',
          easing: 'ease',
          offset: 0,
        }),
        style({
          transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)',
          easing: 'ease',
          offset: 0.1,
        }),
        style({
          transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)',
          easing: 'ease',
          offset: 0.2,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
          easing: 'ease',
          offset: 0.3,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
          easing: 'ease',
          offset: 0.4,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
          easing: 'ease',
          offset: 0.5,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
          easing: 'ease',
          offset: 0.6,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
          easing: 'ease',
          offset: 0.7,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
          easing: 'ease',
          offset: 0.8,
        }),
        style({
          transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
          easing: 'ease',
          offset: 0.9,
        }),
        style({ transform: 'scale3d(1, 1, 1)', easing: 'ease', offset: 1 }),
      ]),
    ),
  ]),
]);

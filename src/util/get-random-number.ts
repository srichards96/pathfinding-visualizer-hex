type Options = {
  min: number;
  max: number;
};
/** Gets random number between inclusive `min` and exclusive `max` */
export function getRandomNumber({ min, max }: Options) {
  return min + Math.floor(Math.random() * max);
}

//@flow

import * as strategies from '../strategies';

const createStrategy = ({
  type,
  options,
}: {
  type: string,
  options: ?Object,
}): Strategy =>
  strategies[type]({
    ...options,
  });

export default createStrategy;

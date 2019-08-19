import { createSelector } from "reselect";

const rootSelector = state => state.adServer;

const switcherType = createSelector(
  rootSelector,
  adServer => adServer.type
);

const orders = createSelector(
  rootSelector,
  adServer => adServer.orders
);

const adServerSelectors = {
  switcherType,
  orders
};

export default adServerSelectors;

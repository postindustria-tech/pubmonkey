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

const adunits = createSelector(
  rootSelector,
  adServer => adServer.adunits
);

const adServerSelectors = {
  switcherType,
  orders,
  adunits
};

export default adServerSelectors;

import Promise from "bluebird";

export function wrapSeries(collection, method, step, times = 1) {
    return Promise.mapSeries(collection, (item, idx, count) =>
        Promise.mapSeries(Array(times), (_, i) =>
            method(item).then(result => {
                step({
                    done: idx * times + i + 1,
                    count: count * times
                });

                return result;
            })
        )
    );
}

export const delay = (ms) => new Promise(res => setTimeout(() => res(ms), ms));

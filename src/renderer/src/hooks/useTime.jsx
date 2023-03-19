const str_pad_left = (string, pad, length) => {
  return (new Array(length + 1).join(pad) + string).slice(-length);
};

export const convertDuration = (refcurrent) => {
  const minutes = Math.floor(refcurrent.duration / 60);
  const seconds = Math.floor(refcurrent.duration - minutes * 60);
  const duration = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
  return duration;
};

export const convertCurrentTime = (refcurrent) => {
  const minutes = Math.floor(refcurrent.currentTime / 60);
  const seconds = Math.floor(refcurrent.currentTime - minutes * 60);
  const currentTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
  return currentTime;
};

const getProgressBarIncremental = (total, current) => {
  return current / total;
};

export const convertToSeconds = (duration, currentTime) => {
  const newDuration = duration.split(':');
  const durMinutes = newDuration[0] * 60;
  const durSeconds = newDuration[1];
  const totalDur = Number(durMinutes) + Number(durSeconds);

  const newCurrentTime = currentTime.split(':');
  const ctMinutes = newCurrentTime[0] * 60;
  const ctSeconds = newCurrentTime[1];
  const totalCt = Number(ctMinutes) + Number(ctSeconds);
  /* console.log(totalDur + totalCt); */

  return getProgressBarIncremental(totalDur, totalCt);
};

export const convertDurationSeconds = (duration) => {
  const splitDuration = duration.split(':');
  return +splitDuration[0] * 60 + +splitDuration[1];
};

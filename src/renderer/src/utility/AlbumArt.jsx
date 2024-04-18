export class AlbumArt {
  constructor(
    releaseId,
    savePath,
    coverResponse,
    title,
    artist,
    barcode,
    country,
    date,
    labelInfo
  ) {
    (this.releaseId = releaseId),
      (this.savePath = savePath),
      (this.coverResponse = coverResponse),
      (this.title = title),
      (this.artist = artist),
      (this.barcode = barcode),
      (this.country = country),
      (this.date = date),
      (this.labelInfo = labelInfo);
  }
}

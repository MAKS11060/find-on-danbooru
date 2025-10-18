#!/usr/bin/env -S deno run -A

/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import {format} from '@std/fmt/bytes'
import {emptyDirSync} from '@std/fs/empty-dir'
import {relative} from '@std/path/relative'
import {BlobWriter, configure, Uint8ArrayReader, ZipWriter} from '@zip.js/zip.js'

let uncompressedSize = 0
let compressedSize = 0

// zip.js
configure({useWebWorkers: false})

const blobWriter = new BlobWriter('application/zip')
const zipWriter = new ZipWriter(blobWriter, {bufferedWrite: true})

// static
const files = [
  'manifest.json',
  'src/icons/danbooru-logo.png',
]

// write to zip
for (const path of files) {
  const file = await Deno.open(path, {read: true})
  const entry = await zipWriter.add(path, file.readable)
  uncompressedSize += entry.uncompressedSize
  compressedSize += entry.compressedSize
}

// build
const build = await Deno.bundle({
  entrypoints: ['src/background.ts'],
  outputPath: './dist/background.js',
  minify: true,
  write: false,
})
if (!build.success) throw console.error(build)

for (const outputFile of build.outputFiles || []) {
  const entry = await zipWriter.add(
    relative(Deno.cwd(), outputFile.path), // to relative
    new Uint8ArrayReader(outputFile.contents!),
  )

  uncompressedSize += entry.uncompressedSize
  compressedSize += entry.compressedSize
}

// save zip file
const blob = await zipWriter.close()
emptyDirSync('dist')
Deno.writeFileSync('dist/build.zip', await blob.bytes())

const compressionRatio = ((1 - compressedSize / uncompressedSize) * 100).toFixed(2)
console.log({
  uncompressedSize: format(uncompressedSize),
  compressedSize: format(compressedSize),
  compressionRatio: `${compressionRatio}%`,
})

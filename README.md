# Front Matter Editor (beta?, alpha?)

![Full screenshot](https://ognjen.io/images/front-matter-editor.gif)

You enter a directory and (optionally) a filter in the top bar:

![Top bar screenshot](https://ognjen.io/images/front-matter-editor-top-bar.png)

The files in the directory that contain the filter are the loaded into a grid:

![Grid screenshot](https://ognjen.io/images/front-matter-editor-grid.png)

And you can edit the front matter attributes from the grid.

The supported field types are:

- Number
- String
- Boolean
- Arrays of numbers and strings (comma separated and then `trim`ed)
- Object (by converting it to JSON)
- Arrays of objects (also by converting to JSON)

Fields can also be set in bulk.

![Grid screenshot](https://ognjen.io/images/front-matter-editor-bulk-set.png)

"Find and replace" at the moment is just a popup with showing how to use `sed -i 's/original/new/g' *.md` to do it.

[The grid uses Material UI grid](https://material-ui.com/components/data-grid/) which supports filtering:

![Filtering screenshot](https://ognjen.io/images/front-matter-editor-filtering.png)

And selectively showing columns:

![Columns screenshot](https://ognjen.io/images/front-matter-editor-columns.png)

## What is it good for?

The two use cases I had in mind are:

- Editing [Dendron](https://dendron.so) notes
- Editing Jekyll posts

## Install

Clone the repo via git and install dependencies:

```bash
git clone https://github.com/ognjenio/front-matter-editor.git
cd front-matter-editor
yarn
```

Then start the app in the `dev` environment:

```bash
yarn start
```

And before making changes please backup your work elsewhere just in case.

The app is not yet packaged for production.

## What's it built in

- React
- Electron
- Typescript
- Material UI

Using the excellent [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) so some remnants may remain.

## Future development

- Buy and implement [XGrid](https://material-ui.com/components/data-grid/#commercial-version)

- Include files from subdirectories
- Autocomplete for directory path
- Saving a directory history for quick access

- Editing file names

- Support regular expressions in file filtering

- Editing content
- Better JSON editing

- Select for boolean fields
- Autocomplete string fields

- Standardize schema

  - Making sure all files have all the attributes
  - Making sure all files that have field that's supposed to be an array is an array

- Find and replace

- Testing
- Building for production

[Contributions welcome.](https://github.com/ognjenio/front-matter-editor)

## Maintainers

- [Ognjen Regoje](https://github.com/ognjenio)

## License

MIT © [Front Matter Editor](https://github.com/ognjenio/front-matter-editor)

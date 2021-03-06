const fs = require("fs");
var url = require("url");
var sharp = require("sharp");
var os = require("os");

exports.newName = (index, slug, fileExtension) => {
  if (index == -1) {
    return `${slug}.${fileExtension}`;
  } else {
    return `${slug}-${index}.${fileExtension}`;
  }
};
exports.buildImageUrl = (nName, queryFieldValue) => {

  let nameAndExt = nName.split(".");
  if (process.env.BUILD_TYPE === "dev"){
    return `http://${os.hostname()}:${process.env.PORT}/api/image/${
      nameAndExt[0]
    }?p=${queryFieldValue}&ext=${nameAndExt[1]}`;
  }else{
    return `https://${os.hostname()}.com:${process.env.PORT}/api/image/${
      nameAndExt[0]
    }?p=${queryFieldValue}&ext=${nameAndExt[1]}`;
  }
  
};
exports.checkSize = (file) => {
  if (file.size > 200000000) {
    return res.status(400).json({
      error: "Image should be less than 2kb in size",
    });
  }
};
exports.changeNameOnly = (newName, photoUrl, photoFolder) => {
  var parts = url.parse(photoUrl, true);
  let ext = parts.query.ext;
  let pathModule = parts.pathname.split("/");
  let oldName = `${pathModule[pathModule.length - 1]}`;
  exports.photoResolutionTypes.forEach((element) => {
    let oldPath = `./${process.env.CLIENT_NAME}/images/${element.res}/${photoFolder.folderName}/${oldName}.${ext}`;
    let newPath = `./${process.env.CLIENT_NAME}/images/${element.res}/${photoFolder.folderName}/${newName}.${ext}`;
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  });

  return exports.buildImageUrl(`${newName}.${ext}`, photoFolder.folderName);
};
exports.processImage = async (index, file, slug, photoFolder, resObjs) => {
  let nName = exports.newName(
    index,
    slug,
    file.path.split("/")[2].split(".")[1]
  );
  await exports.createLowRes(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[0]
  );
  await exports.createMediumRes(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[1]
  );
  await exports.createHighRes(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[2]
  );
  await exports.unlinkTemporaryFile(file.path);
  return exports.buildImageUrl(nName, photoFolder.folderName);
};

exports.photoResolutionTypes = [
  // low medium high order is importent
  { width: 200, res: "low" },
  { width: 400, res: "medium" },
  { width: 700, res: "high" },
];
exports.photoResolutionTypesLogo = [
  // low medium high order is importent
  { width: 100, res: "low" },
  { width: 150, res: "medium" },
  { width: 200, res: "high" },
];
exports.photoResolutionTypesTutorial = [
  // low medium high order is importent
  { width: 200, res: "low" },
  { width: 400, res: "medium" },
  { width: 650, res: "high" },
];
exports.photoResolutionGallery = [
  // low medium high order is importent
  { width: 200, res: "low" },
  { width: 400, res: "medium" },
  { width: 700, res: "high" },
];
exports.photoResolutionTypeslanding = [
  // low medium high order is importent
  { width: 400, res: "low" },
  { width: 800, res: "medium" },
  { width: 1200, res: "high" },
];

exports.photosFolder = [
  { folderName: "pl" }, // pl photo landing for home
  { folderName: "pfs" }, // pfs photo tutorial
  { folderName: "hg" }, // hg gallery for home
  { folderName: "lg" }, // lg logo for home
];

exports.initClientDir = () => {
  let clientDir = `./${process.env.CLIENT_NAME}`;
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir);
  }
  clientDir = `./${process.env.CLIENT_NAME}/images`;
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir);
  }
  exports.photoResolutionTypes.forEach((element) => {
    let dir = `${clientDir}/${element.res}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    exports.photosFolder.forEach((ele) => {
      let dir = `${clientDir}/${element.res}/${ele.folderName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });
  });
  return clientDir;
};

exports.unlinkStaticFile = (photoUrl, folderName) => {
  console.log("unlinkstaticfile", photoUrl, folderName);
  if (photoUrl && photoUrl.length > 0) {
    var parts = url.parse(photoUrl, true);
    let ext = parts.query.ext;
    let pathModule = parts.pathname.split("/");
    let fileName = `${pathModule[pathModule.length - 1]}.${ext}`;
    console.log("unlinkstaticfile file name", fileName);

    exports.photoResolutionTypes.forEach((element) => {
      let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${folderName}/${fileName}`;

      if (fs.existsSync(path)) {
        fs.unlinkSync(path, function (err) {
          console.log("error unlink", err);
        });
      }
    });
  }
};

exports.unlinkTemporaryFile = (photoUrl) => {
  if (photoUrl && photoUrl.length > 0) {
    if (fs.existsSync(photoUrl)) {
      fs.unlinkSync(photoUrl, function (err) {
        if (err) console.log("error unlink", err);
      });
    } else {
    }
  } else {
  }
};

exports.createLowRes = async (path, photoFolderName, newName, resObj) => {
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 100 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFolderName}/${newName}`
    );
};
exports.createMediumRes = async (path, photoFolderName, newName, resObj) => {
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 100 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFolderName}/${newName}`
    );
};
exports.createHighRes = async (path, photoFolderName, newName, resObj) => {
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 100 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFolderName}/${newName}`
    );
};
exports.renameFile = async (file, newPath) => {
  fs.renameSync(file.path, newPath);
  console.log("renaming file");
};

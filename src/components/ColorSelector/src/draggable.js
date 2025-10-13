let starting;

export default function (element, options) {

	const eventStart = function (event) {
    event.preventDefault();
		if (starting) {
			return;
		}

		document.addEventListener("mousemove", eventMove);
		document.addEventListener("touchmove", eventMove, {passive: false});
		document.addEventListener("mouseup", eventEnd);
		document.addEventListener("touchend", eventEnd, {passive: false});

		document.ondragstart = function () {return false;}
		document.onselectstart = function () {return false;}

		starting = true;

		if (options.startFun) {
			options.startFun(event);
		}
	}

	const eventMove = function (event) {
    event.preventDefault();

		if (options.moveFun) {
			options.moveFun(event);
		}
	}

	const eventEnd = function (event) {
    event.preventDefault();

		document.removeEventListener("mousemove", eventMove);
		document.removeEventListener("touchmove", eventMove);
		document.removeEventListener("mouseup", eventEnd);
		document.removeEventListener("touchend", eventEnd);

		document.ondragstart = null;
		document.onselectstart = null;

		starting = false;

		if (options.endFun) {
			options.endFun(event);
		}
	}

	if (options.start) {
		element.addEventListener("mousedown", eventStart);
		element.addEventListener("touchstart", eventStart, {passive: false});
	} else {
		element.removeEventListener("mousedown", eventStart);
		element.removeEventListener("touchstart", eventStart);
	}
}

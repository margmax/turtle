var color, i, j, k, len, ref, ref1, sides, x;

eval($.turtle());

speed(100);


    for (x = k = 1, ref1 = sides; 1 <= ref1 ? k <= ref1 : k >= ref1; x = 1 <= ref1 ? ++k : --k) {
      fd(100 / sides);
      lt(360 / sides);
    }
    pen('red');
    fd(40);

  slide(40, -160);

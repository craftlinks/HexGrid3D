export function simulation(current_state_buffer: Int32Array, next_state_buffer: Int32Array, hexGridDimensions: number[2]) {
    
    // Set of parameters
    const bin_size          : number = 1;         //  Bin size
    const residual_rate     : number = 0.05000;        //  Residual rate
    const removal_rate      : number = 0.0080000;      //  Removal rate
    const init_token_number : number = 10000;          //  Generarion number of tokens
    const morphogenesis     : number = 0.600 ;       //  Morphogenesis parameter

    

    // For every cell in the grid call the ring function
    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            let state = current_state_buffer[index(x, y)];
            let tokens = current_state_buffer.subarray(index(x, y) + 1, index(x, y) + bin_size + 1)[0]; // TODO Geert: create a function for this!
            if (state > 0) {
                console.log("BEFORE:", "c: ", state, "t: ", tokens);
                current_state_buffer.subarray(index(x, y) + 1, index(x, y) + bin_size + 1)[0] = init_token_number; // If cell has tokens then re-init token number
                console.log("AFTER:", "c: ", state, "t: ", current_state_buffer[index(x, y) + 1]);
            }
        }
    }

    // for (var s = 0; s <= bin_size; s = s + 1) {
    //     for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
    //         for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
                
    //         }
    //     }
    // }
    
    // This is the simulation code.
    // It's a simple copy of the current state to the next state.
    next_state_buffer.set(current_state_buffer);

    function index(x, y): number {
        let _x = (x +  hexGridDimensions[0]) % hexGridDimensions[0];
        let _y = (y + hexGridDimensions[1]) % hexGridDimensions[1];
        return _y * (hexGridDimensions[0]* (bin_size + 1)) + (_x * (bin_size + 1));
    }

    function ring(x: number, y: number, radius: number, c: number)  {
        if (c == 0) {
            return;
        }
        let _x = x;
        let _y = y;
        //  move radius times down left
        for (var i = 0; i < radius; i = i + 1) {
            let par = parity(y); 
            _x = _x - par;
            _y = _y - 1;
        }
        var _token = c;
        var neighbor_coordinate = [_x,_y];
        for (var i = 0; i < 6; i = i + 1) {
            for (var j = 0; j < radius; j = j + 1) {
                
                if (_token <= 0) {
                    break;
                }
                
                next_state_buffer[index(neighbor_coordinate[0], neighbor_coordinate[1])] += 1;
                next_state_buffer[index(x, y)] -= 1;
                
                _token = _token - 1;
                neighbor_coordinate = neighbor(neighbor_coordinate[0], neighbor_coordinate[1], directions[i]);
            }
        }
    }

    // // For every cell in the grid call the ring function
    // for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
    //     for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
    //         let c = current_state_buffer[index(x, y)];
    //         if (c > 0) {
    //             ring(x, y, 1, c);
    //         }
    //     }
    // }

    return current_state_buffer;
}




function neighbor(x: number, y: number, dir: number[2]): number[2] {
    let par = parity(y);
    if (dir[1] == 0) {
        return [x + dir[0], y];
    }
    else {
        return [x + dir[0] - par, y + dir[1]];
    }  
}

function parity(y): number {
    return y & 1;
}

const directions: number[6][2] = [
    [1, 0], // R
    [1, 1], // UR
    [0, 1], // UL
    [-1, 0], // L
    [0, -1], // DL
    [1, -1] // DR
];
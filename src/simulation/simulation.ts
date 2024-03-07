export function simulation(current_state_buffer: Int32Array, next_state_buffer: Int32Array, hexGridDimensions: number[2]) {
    console.log("Simulation");
    // Set of parameters
    const bin_size          : number = 24;         //  Bin size
    const residual_rate     : number = 0.00400;        //  Residual rate
    const removal_rate      : number = 0.0080000;      //  Removal rate
    const init_token_number : number = 10000;          //  Generarion number of tokens
    const morphogenesis     : number = 0.6 ;       //  Morphogenesis parameter
    
    next_state_buffer.fill(0);

    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            let state = current_state_buffer[index(x, y)];
            next_state_buffer.fill(0);
            let tokens =  get_tokens(x,y, current_state_buffer);
            if (state > 0) {
                tokens[0] = init_token_number; // If cell has tokens then re-init token number
                // console.log(state, x, y, tokens);
            }
        }
    }
    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            const c_tokens = get_tokens(x,y,current_state_buffer)[0]; // Current cell tokens in active cell
            if (c_tokens == 0) {
                continue;
            }
            spiral(x, y, 1, bin_size);
        }
    }

    // Applying state transition rules
    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            // Count the number of tokens
            var lower_count = 0;
            var upper_count = 0;
            var cell_tokens =  get_tokens(x, y, next_state_buffer);
            for (var current_bin_idx = 0; current_bin_idx < (bin_size/2)-1; current_bin_idx += 1) {
                lower_count +=cell_tokens[current_bin_idx];
                    
            }
            for (var current_bin_idx = (bin_size/2); current_bin_idx < bin_size; current_bin_idx += 1) {
                upper_count += cell_tokens[current_bin_idx];
            }
            
             // console.log("Lower Count", lower_count, "Upper Count", upper_count);
            // Judgment of the next cell state 
            if (lower_count == 0 || upper_count == 0) {
                next_state_buffer[index(x, y)] = 0;
                continue;
            }
            
            let criterium = Math.floor(lower_count / upper_count);
            
            
            if(criterium < 100.0 ) {
                next_state_buffer[index(x, y)] = 0;
                // console.log("Criterium", criterium);
            }
            else {
                next_state_buffer[index(x, y)] = 1;
            }

        }
    }

    return current_state_buffer;

    function get_tokens(x: number, y: number, buffer: Int32Array): Int32Array {
        let tokens = buffer.subarray(index(x, y) + 1, index(x, y) + bin_size + 1);
        return tokens;
    }

    function index(x, y): number {
        let _x = (x +  hexGridDimensions[0]) % hexGridDimensions[0];
        let _y = (y + hexGridDimensions[1]) % hexGridDimensions[1];
        return _y * (hexGridDimensions[0]* (bin_size + 1)) + (_x * (bin_size + 1));
    }

    function spiral(x, y, i_radius: u32, o_radius: u32) {
        for (var i = i_radius; i <= o_radius; i = i + 1) {
            ring(x, y, i);
        }
        get_tokens(x,y,next_state_buffer)[0] = get_tokens(x, y, current_state_buffer)[0];
    }

    function ring(x: number, y: number, radius: number)  {
        
        var init_tokens = get_tokens(x, y, current_state_buffer)
        var c_tokens = init_tokens[0];
        // console.log("INIT TOKENS", init_tokens[0]);
        if (init_tokens <= 0) {
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
        var neighbor_coordinate = [_x,_y];

        for (var i = 0; i < 6; i = i + 1) {
            if (c_tokens <= 0) {
                break;
            }
            for (var j = 0; j < radius; j = j + 1) {
                
                if (c_tokens <= 0) {
                    init_tokens[0] = 0;
                    break;
                }
                const unit_tokens = Math.round(init_tokens[0]*(1.0 - residual_rate) / (radius * 6 * 6)) 
                if (unit_tokens < init_token_number * removal_rate) {
                    c_tokens = 0;
                    break;
                }
                c_tokens -= unit_tokens;
                var n_tokens = get_tokens(neighbor_coordinate[0], neighbor_coordinate[1], next_state_buffer);
                n_tokens[radius] += unit_tokens;
                neighbor_coordinate = neighbor(neighbor_coordinate[0], neighbor_coordinate[1], directions[i]);

                console.log(_x, _y, radius, n_tokens[radius])
            }
        }
        init_tokens[0] = c_tokens;
        // console.log("Ring", x, y, radius, c_tokens);
    }    
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
export function simulation(current_state_buffer: Int32Array, next_state_buffer: Int32Array, hexGridDimensions: number[2]) {
    
    // Set of parameters
    const bin_size          : number = 24;         //  Bin size
    const residual_rate     : number = 0.05000;        //  Residual rate
    const removal_rate      : number = 0.0080000;      //  Removal rate
    const init_token_number : number = 10000;          //  Generarion number of tokens
    const morphogenesis     : number = 0.600 ;       //  Morphogenesis parameter

    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            let state = current_state_buffer[index(x, y)];
            let tokens =  get_tokens(x,y, current_state_buffer);
            tokens.fill(0); // Reset tokens
            if (state > 0) {
                tokens[0] = init_token_number; // If cell has tokens then re-init token number
            }
        }
    }

    for (var current_bin_idx = 0; current_bin_idx < bin_size; current_bin_idx += 1) {
        for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
            for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
                ring(x, y, 1, current_bin_idx)
            }
        }
        for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
            for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
                // Reduce the number of tokens to 0 by the removal rate 
                var current_tokens = get_tokens(x,y, next_state_buffer);
                if (current_tokens[current_bin_idx] < (init_token_number * removal_rate)) {
                    current_tokens[current_bin_idx] = 0;
                } 
                if (current_tokens[current_bin_idx + 1] <(init_token_number * removal_rate)) {
                    current_tokens[current_bin_idx + 1] = 0;
                }
            }
        }
    }

    // Applying state transition rules
    for (var y = 0; y < hexGridDimensions[1]; y = y + 1) {
        for (var x = 0; x < hexGridDimensions[0]; x = x + 1) {
            // Count the number of tokens
            var lower_count = 0;
            var upper_count = 0;
            
            for (var current_bin_idx = 0; current_bin_idx < (bin_size/2)-1; current_bin_idx += 1) {
                lower_count += get_tokens(x, y, next_state_buffer)[current_bin_idx];
                   
            }
            for (var current_bin_idx = (bin_size/2); current_bin_idx < bin_size; current_bin_idx += 1) {
                upper_count += get_tokens(x, y, next_state_buffer)[current_bin_idx];
            }
            upper_count = upper_count + lower_count;
            // Judgment of the next cell state 
            if(lower_count > ((upper_count)*morphogenesis) ) {
                next_state_buffer[index(x, y)] = 1;
            }
            if(lower_count < ((upper_count)*morphogenesis) ) {
                next_state_buffer[index(x, y)] = 0;
            }
            if(lower_count == ((upper_count)*morphogenesis) ) {
                if (current_state_buffer[index(x,y)] == 0)  next_state_buffer[index(x, y)] = 0 ;
                if (current_state_buffer[index(x,y)] == 1)  next_state_buffer[index(x, y)] = 1 ;
            } ;
        }
    }


    function get_tokens(x: number, y: number, buffer: Int32Array): Int32Array {
        let tokens = buffer.subarray(index(x, y) + 1, index(x, y) + bin_size + 1);
        return tokens;
    }

    function index(x, y): number {
        let _x = (x +  hexGridDimensions[0]) % hexGridDimensions[0];
        let _y = (y + hexGridDimensions[1]) % hexGridDimensions[1];
        return _y * (hexGridDimensions[0]* (bin_size + 1)) + (_x * (bin_size + 1));
    }

    function ring(x: number, y: number, radius: number, current_bin_idx: number)  {
        var c_tokens = get_tokens(x, y, current_state_buffer);
        
        if (c_tokens[current_bin_idx] == 0) {
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

        // Distribute tokens to neighbors
        let number_of_tokens_to_available = c_tokens[current_bin_idx];
        for (var i = 0; i < 6; i = i + 1) {
            for (var j = 0; j < radius; j = j + 1) {
                
                if (c_tokens[current_bin_idx] <= 0) {
                    break;
                }
                
                c_tokens[current_bin_idx] -= Math.round(number_of_tokens_to_available*(1.0 - residual_rate) / 7);
                var n_tokens = get_tokens(neighbor_coordinate[0], neighbor_coordinate[1], next_state_buffer);
                n_tokens[current_bin_idx + 1] += Math.round(number_of_tokens_to_available*(1.0 - residual_rate) / 7);
                neighbor_coordinate = neighbor(neighbor_coordinate[0], neighbor_coordinate[1], directions[i]);
            }
        }

        // Tokens remaining in the current cell
        c_tokens[current_bin_idx] -= number_of_tokens_to_available * residual_rate;
        n_tokens[current_bin_idx] += number_of_tokens_to_available * residual_rate;

        // If there is a remainder, the direction will be assigned by a random number. 
        while (c_tokens[current_bin_idx] > 0) {
            let random_direction = Math.floor(Math.random() * 7);
            c_tokens[current_bin_idx] -= 1;
            if (random_direction <= 5) {
                neighbor_coordinate = neighbor(neighbor_coordinate[0], neighbor_coordinate[1], directions[random_direction]);
                n_tokens = get_tokens(neighbor_coordinate[0], neighbor_coordinate[1], next_state_buffer);
                n_tokens[current_bin_idx + 1] += 1;
            }
            else {
                n_tokens[current_bin_idx] += 1;
            }
        } 
    }

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
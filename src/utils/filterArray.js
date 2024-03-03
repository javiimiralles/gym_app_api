import { DifficultyEnum } from '../enums/DifficultyEnum.js';

export const filterDifficulty = (difficulties) => {
    const countHigh = difficulties.filter(d => d === DifficultyEnum.High).length;
    const countMedium = difficulties.filter(d => d === DifficultyEnum.Medium).length;
    const countLow = difficulties.filter(d => d === DifficultyEnum.Low).length;

    let maxCount = Math.max(countHigh, countMedium, countLow);

    return maxCount === countHigh ? DifficultyEnum.High
        : maxCount === countLow ? DifficultyEnum.Low
        : DifficultyEnum.Medium;
}

export const filterMuscles = (muscles) => {
    // Contar las repeticiones de cada músculo
    const contMuscles = muscles.reduce((cont, muscle) => {
        cont[muscle] = (cont[muscle] ||  0) + 1;
        return cont;
    }, {});

    // Convertir el objeto de conteo en un array y ordenarlo
    const sortedMuscles = Object.entries(contMuscles)
        .sort((a, b) => b[1] - a[1]) // Ordena por número de repeticiones, de mayor a menor
        .map(item => item[0]); // Extrae solo el nombre del músculo

    return sortedMuscles;
}
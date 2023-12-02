import { React } from "react";
import { View } from "../ui-kit";
import { PieChart } from "react-native-svg-charts";
import { Text } from 'react-native-svg';


export default (props) => {
    let piechartObj = props?.chartdata || {};

    const data = [
        {
            key: "Attended",
            amount: piechartObj?.attended || 0,
            svg: { fill: '#0000FF' },
        },
        {
            key: "Acknowledge",
            amount: piechartObj?.acknowledgeCounnt || 0,
            svg: { fill: '#00ffff' }
        },
        {
            key: "Not Attended",
            amount: piechartObj?.notAttended || 0,
            svg: { fill: '#ffa500' }
        },
        {
            key: "Seggregated",
            amount: piechartObj?.segregationCount || 0,
            svg: { fill: '#008000' }
        }
    ];

    const Labels = ({ slices, height, width }) => {
        return slices.map((slice, index) => {
            const { labelCentroid, pieCentroid, data } = slice;
            return (
                <Text
                    key={index}
                    x={pieCentroid[0]}
                    y={pieCentroid[1]}
                    fill={'white'}
                    textAnchor={'middle'}
                    alignmentBaseline={'middle'}
                    fontSize={15}
                    stroke={'black'}
                    strokeWidth={0.2}
                >
                    {data.amount}
                </Text>
            )
        })
    }

    return (
        <View row>
            <PieChart
                style={{ height: 150, width: 150, position: "absolute", bottom: 100, left: 10 }}
                valueAccessor={({ item }) => item.amount}
                data={data}
                outerRadius={'70%'}
                innerRadius={10}

            >
                <Labels />
            </PieChart>

        </View>
    )
}

